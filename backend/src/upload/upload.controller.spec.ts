import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  let controller: UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should throw BadRequestException when no file is provided', () => {
      expect(() => controller.uploadImage(undefined as any)).toThrow(
        BadRequestException,
      );
    });

    it('should return file information when file is uploaded', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        filename: 'file-123456.png',
        path: 'uploads/file-123456.png',
        destination: './uploads',
        buffer: Buffer.from(''),
        stream: null as any,
      };

      const result = controller.uploadImage(mockFile);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('originalName');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('mimetype');
      expect(result.url).toContain('/uploads/');
      expect(result.filename).toBe('file-123456.png');
      expect(result.originalName).toBe('test.png');
      expect(result.size).toBe(1024);
      expect(result.mimetype).toBe('image/png');
    });
  });
});
