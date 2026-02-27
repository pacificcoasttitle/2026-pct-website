#!/bin/bash
# Updates all industry-documents/ relative links to absolute URLs
# pointing to https://documents.pct.com
#
# Run from the Master-Repo root in Git Bash:
#   bash update-doc-links.sh

BASE_URL="https://documents.pct.com"

# All HTML files in root that reference industry-documents (excluding worktrees and the folder itself)
FILES=(
  "benefits-title-insurance.html"
  "blank-forms.html"
  "blank-forms-alt.html"
  "commercial-resources.html"
  "educational-booklets.html"
  "flyer-center.html"
  "index.html"
  "index-old.html"
  "index-tessa-enhanced.html"
  "index-tessa-enhanced.32.html"
  "index-tessa-enhanced-3.3.0.html"
  "informational-flyers.html"
  "notices.html"
  "rate-book.html"
  "sb2-forms.html"
  "top-10-title-problems.html"
  "what-is-title-insurance.html"
  "assets/media/components/b-main-slider/index.html"
  "assets-backup/media/components/b-main-slider/index.html"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Replace href="industry-documents/ (no leading slash)
    sed -i "s|href=\"industry-documents/|href=\"${BASE_URL}/industry-documents/|g" "$FILE"

    # Replace href="/industry-documents/ (leading slash variant)
    sed -i "s|href=\"/industry-documents/|href=\"${BASE_URL}/industry-documents/|g" "$FILE"

    # Replace src="industry-documents/ (in case any images/assets use this)
    sed -i "s|src=\"industry-documents/|src=\"${BASE_URL}/industry-documents/|g" "$FILE"

    echo "Updated: $FILE"
  else
    echo "Skipped (not found): $FILE"
  fi
done

echo ""
echo "Done. All industry-documents links updated to ${BASE_URL}/industry-documents/"
