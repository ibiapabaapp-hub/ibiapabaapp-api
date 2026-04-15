/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { VersioningType } from "@nestjs/common";

let mockShouldFail = false;
let capturedAppMock: any;

jest.mock("@nestjs/core", () => {
  const originalModule = jest.requireActual("@nestjs/core");
  return {
    ...originalModule,
    NestFactory: {
      create: jest.fn().mockImplementation(() => {
        if (mockShouldFail) {
          return Promise.reject(new Error("bootstrap failed"));
        }
        return Promise.resolve(capturedAppMock);
      }),
    },
  };
});

jest.mock("@nestjs/swagger", () => {
  const original = jest.requireActual("@nestjs/swagger");
  return {
    ...original,
    SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() },
    DocumentBuilder: jest.fn().mockImplementation(() => ({
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      build: jest.fn(),
    })),
  };
});

describe("main bootstrap", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockShouldFail = false;

    capturedAppMock = {
      useGlobalInterceptors: jest.fn(),
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableVersioning: jest.fn(),
      use: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      init: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockReturnValue({
        serialize: jest.fn(),
      }),
      getHttpAdapter: jest.fn().mockReturnValue({
        getInstance: jest.fn().mockReturnValue({
          set: jest.fn(),
        }),
      }),
    };
  });

  it("should bootstrap the application correctly", async () => {
    process.env.PORT = "4000";
    const { bootstrap } = require("./main");
    await bootstrap();

    expect(capturedAppMock.setGlobalPrefix).toHaveBeenCalledWith("/api");
    expect(capturedAppMock.enableVersioning).toHaveBeenCalledWith(
      expect.objectContaining({
        type: VersioningType.URI,
        defaultVersion: "1",
      }),
    );
    expect(capturedAppMock.listen).toHaveBeenCalledWith("4000");
  });

  it("should throw error on bootstrap failure", async () => {
    mockShouldFail = true;
    const { bootstrap } = require("./main");

    await expect(bootstrap()).rejects.toThrow("bootstrap failed");
  });
});
