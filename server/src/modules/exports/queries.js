export const EXPORT_RESOURCE_QUERY = `
  query ExportResource($input: ExportResourceInputDto!) {
    exportResource(input: $input) {
      filename
      mimeType
      base64
    }
  }
`;
