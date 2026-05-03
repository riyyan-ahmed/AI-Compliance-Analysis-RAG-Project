const pdfParse = jest.fn().mockResolvedValue({
  text: 'Mocked PDF text content for testing purposes.',
  numpages: 1,
  info: {},
});

export default pdfParse;
