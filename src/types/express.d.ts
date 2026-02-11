declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        id?: string;
        tokenId?: string;
        type?: string;
        [key: string]: any;
      };
      currentUser?: any;
      user?: any;
    }
  }
}

export {};
