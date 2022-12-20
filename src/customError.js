const errorTypes = {
    VISUALIZATION: 'Visualization',
    ENCODINGANDDECODING: 'Encoding/Decoding'
}

class CustomError extends Error {
  constructor(type, message) {
    super();
    this.message = message;
    this.stack = new Error().stack;
    this.type = type
  }
}

export {errorTypes, CustomError};