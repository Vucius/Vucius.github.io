# frozen_string_literal: true

# Patch File.exists? which was removed in Ruby 3.2, required by org-ruby 0.9.12
unless File.respond_to?(:exists?)
  class << File
    alias_method :exists?, :exist?
  end
end

module Jekyll
  module OrgDocument
    # Redefine to support Ruby 3 keyword arguments compatibility
    def read_content(**opts)
      return super(**opts) unless org_file?

      self.content = File.read(path, **Utils.merged_file_read_opts(site, opts))
      converter = site.find_converter_instance(Jekyll::Converters::Org)
      parser, settings = converter.parse_org(self.content)

      @data = Utils.deep_merge_hashes(self.data, settings)
      self.content = converter.actually_convert(parser)
    end
  end

  module OrgPage
    # Redefine to support Ruby 3 keyword arguments compatibility for File.read
    def read_yaml(base, name, opts = {})
      extname  = File.extname(name)
      return super(base, name, opts) unless Jekyll::Converters::Org.matches(extname)

      self.data ||= Hash.new()
      self.content = File.read(@path || site.in_source_dir(base, name),
                               **Utils.merged_file_read_opts(site, opts))
      converter = site.find_converter_instance(Jekyll::Converters::Org)
      parser, settings = converter.parse_org(self.content)

      self.content = converter.actually_convert(parser)
      self.data = Utils.deep_merge_hashes(self.data, settings)
    end
  end
end

# Hook to ensure that any date strings parsed from Org-mode files are coerced
# into proper Ruby Time objects, preventing comparison and sorting errors in Jekyll.
Jekyll::Hooks.register :site, :post_read do |site|
  site.documents.each do |doc|
    if doc.data["date"].is_a?(String)
      begin
        doc.data["date"] = Jekyll::Utils.parse_date(
          doc.data["date"].to_s,
          "Document '#{doc.relative_path}' does not have a valid date."
        )
      rescue => e
        Jekyll.logger.warn "Warning:", "Failed to parse Org-mode date for #{doc.relative_path}: #{e.message}"
      end
    end
  end
end
