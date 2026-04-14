import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { profile_type } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaService } from "src/modules/common/prisma/prisma.service";

import { CreateProfileDTO } from "../dto/create-profile.dto";
import { UpdateProfileDTO } from "../dto/update-profile.dto";
import { ProfilesService } from "../profiles.service";

describe("ProfilesService", () => {
  let service: ProfilesService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new profile with account_profile relation", async () => {
      const dto: CreateProfileDTO = {
        slug: "john-doe",
        display_name: "John Doe",
        bio: "A test bio",
        type: "personal" as profile_type,
      };

      const createdProfile = {
        id: "profile-id",
        slug: "john-doe",
        display_name: "John Doe",
        bio: "A test bio",
        type: "personal",
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      prisma.profile.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockResolvedValue([createdProfile]);

      const result = await service.create("account-id", dto);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { slug: "john-doe" },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(createdProfile);
    });

    it("should throw BadRequestException if slug already exists", async () => {
      const dto: CreateProfileDTO = {
        slug: "existing-slug",
        display_name: "John Doe",
        type: "personal" as profile_type,
      };

      prisma.profile.findUnique.mockResolvedValue({ id: "existing" } as any);

      await expect(service.create("account-id", dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAllByAccountId", () => {
    it("should return all profiles for an account", async () => {
      const accountProfiles = [
        {
          profile: {
            id: "profile-1",
            slug: "john-doe",
            display_name: "John Doe",
            bio: null,
            avatar_url: null,
            type: "personal",
            created_at: new Date(),
            updated_at: new Date(),
            interests: [
              {
                category: { id: "cat-1", name: "Technology" },
              },
            ],
          },
        },
      ];

      prisma.account_profile.findMany.mockResolvedValue(accountProfiles as any);

      const result = await service.findAllByAccountId("account-id");

      expect(prisma.account_profile.findMany).toHaveBeenCalledWith({
        where: { account_id: "account-id" },
        include: {
          profile: {
            include: {
              interests: {
                include: {
                  category: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("john-doe");
      expect(result[0].interests).toEqual([
        { id: "cat-1", name: "Technology" },
      ]);
    });
  });

  describe("findOneById", () => {
    it("should return a profile if found and belongs to account", async () => {
      const accountProfile = {
        profile_id: "profile-id",
        account_id: "account-id",
      };
      const profile = {
        id: "profile-id",
        slug: "john-doe",
        display_name: "John Doe",
        bio: null,
        avatar_url: null,
        type: "personal",
        created_at: new Date(),
        updated_at: new Date(),
        interests: [
          {
            category: { id: "cat-1", name: "Technology" },
          },
        ],
      };

      prisma.account_profile.findFirst.mockResolvedValue(accountProfile as any);
      prisma.profile.findUnique.mockResolvedValue(profile as any);

      const result = await service.findOneById("profile-id", "account-id");

      expect(result.slug).toBe("john-doe");
      expect(result.interests).toEqual([{ id: "cat-1", name: "Technology" }]);
    });

    it("should throw NotFoundException if profile does not belong to account", async () => {
      prisma.account_profile.findFirst.mockResolvedValue(null);

      await expect(
        service.findOneById("profile-id", "account-id"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a profile if it belongs to account", async () => {
      const accountProfile = {
        profile_id: "profile-id",
        account_id: "account-id",
      };
      const updatedProfile = {
        id: "profile-id",
        slug: "john-doe-updated",
        display_name: "John Doe Updated",
        bio: "Updated bio",
        type: "personal",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const dto: UpdateProfileDTO = {
        display_name: "John Doe Updated",
        bio: "Updated bio",
      };

      prisma.account_profile.findFirst.mockResolvedValue(accountProfile as any);
      prisma.profile.update.mockResolvedValue(updatedProfile as any);

      const result = await service.update("profile-id", "account-id", dto);

      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { id: "profile-id" },
        data: {
          display_name: "John Doe Updated",
          bio: "Updated bio",
        },
      });
      expect(result.display_name).toBe("John Doe Updated");
    });

    it("should throw NotFoundException if profile does not belong to account", async () => {
      prisma.account_profile.findFirst.mockResolvedValue(null);

      await expect(
        service.update("profile-id", "account-id", {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a profile if it belongs to account", async () => {
      const accountProfile = {
        profile_id: "profile-id",
        account_id: "account-id",
      };
      const profile = {
        id: "profile-id",
        slug: "john-doe",
        display_name: "John Doe",
      };

      prisma.account_profile.findFirst.mockResolvedValue(accountProfile as any);
      prisma.profile.findUnique.mockResolvedValue(profile as any);
      prisma.profile.delete.mockResolvedValue(profile as any);

      const result = await service.remove("profile-id", "account-id");

      expect(prisma.profile.delete).toHaveBeenCalledWith({
        where: { id: "profile-id" },
      });
      expect(result).toEqual(profile);
    });

    it("should throw NotFoundException if profile does not belong to account", async () => {
      prisma.account_profile.findFirst.mockResolvedValue(null);

      await expect(service.remove("profile-id", "account-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("isProfileOwner", () => {
    it("should return true if account owns profile", async () => {
      const accountProfile = {
        profile_id: "profile-id",
        account_id: "account-id",
      };
      prisma.account_profile.findFirst.mockResolvedValue(accountProfile as any);

      const result = await service.isProfileOwner("profile-id", "account-id");

      expect(result).toBe(true);
    });

    it("should return false if account does not own profile", async () => {
      prisma.account_profile.findFirst.mockResolvedValue(null);

      const result = await service.isProfileOwner("profile-id", "account-id");

      expect(result).toBe(false);
    });
  });
});
