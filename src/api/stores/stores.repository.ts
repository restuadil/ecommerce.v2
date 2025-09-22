import { Injectable } from "@nestjs/common";

import { Store } from "@prisma/client";

import { PrismaService } from "src/common/prisma/prisma.service";

import { CreateStoreDto } from "./dto/create-store.dto";

@Injectable()
export class StoresRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findStoreByStoreAdminId(storeAdminId: string): Promise<Store | null> {
    return this.prismaService.store.findFirst({
      where: {
        admin: {
          id: storeAdminId,
        },
      },
    });
  }
  async create(adminId: string, data: CreateStoreDto): Promise<Store> {
    const { name, status, description, domain, logo } = data;
    return this.prismaService.store.create({
      data: {
        name,
        status,
        description,
        domain,
        logo,
        adminId,
      },
    });
  }
}
