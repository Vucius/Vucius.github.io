# frozen_string_literal: true

# Patch File.exists? which was removed in Ruby 3.2, required by org-ruby 0.9.12
unless File.respond_to?(:exists?)
  class << File
    alias_method :exists?, :exist?
  end
end

# Hook to ensure that any date strings parsed from Org-mode files are coerced
# into proper Ruby Time objects, preventing comparison and sorting errors in Jekyll.
Jekyll::Hooks.register :documents, :post_read do |doc|
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
