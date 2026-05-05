jq --slurpfile docs assets/payloads/docs-manifest.json '
  ( $docs[0] | INDEX(.slug) ) as $docs_map |
  walk(
    if type == "object" and .type == "file" then
      . + ($docs_map[.id] // {})
    else
      .
    end
  )
' assets/payloads/manifest.json > ../assets/payloads/unified-manifest.json
