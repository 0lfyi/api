/* eslint-disable max-classes-per-file */

class HTTPError {
  public readonly code: number;

  public readonly message: string;

  public readonly contentType: string;

  public constructor(code: number, message: string, contentType = 'text/plain') {
    this.code = code;
    this.message = message;
    this.contentType = contentType;
  }
}

export class BadRequest extends HTTPError {
  public constructor(message = 'Bad Request', contentType?: string) {
    super(400, message, contentType);
  }
}

export class Unauthorized extends HTTPError {
  public constructor(message = 'Unauthorized', contentType?: string) {
    super(401, message, contentType);
  }
}

export class Forbidden extends HTTPError {
  public constructor(message = 'Forbidden', contentType?: string) {
    super(403, message, contentType);
  }
}

export class NotFound extends HTTPError {
  public constructor(message = 'Not Found', contentType?: string) {
    super(404, message, contentType);
  }
}

export default HTTPError;
