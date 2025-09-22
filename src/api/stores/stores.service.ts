import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { UserPayload } from "src/types/jwt.type";

import { CreateStoreDto } from "./dto/create-store.dto";
import { ResponseStoreDto } from "./dto/response-store.dto";
import { StoresRepository } from "./stores.repository";

@Injectable()
export class StoresService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly storesRepository: StoresRepository,
  ) {}

  async findStoreByStoreAmdinId(storeAdminId: string): Promise<ResponseStoreDto | null> {
    return await this.storesRepository.findStoreByStoreAdminId(storeAdminId);
  }
  async getStoreByStoreAdminId(storeAdminId: string): Promise<ResponseStoreDto> {
    const store = await this.findStoreByStoreAmdinId(storeAdminId);
    if (!store) throw new NotFoundException("Store not found");
    return store;
  }
  async create(me: UserPayload, createStoreDto: CreateStoreDto): Promise<ResponseStoreDto> {
    const { name, status, description, domain, logo } = createStoreDto;
    const existing = await this.storesRepository.findStoreByStoreAdminId(me.id);
    if (existing) throw new ConflictException("Store already exists");
    const store = await this.storesRepository.create(me.id, {
      name,
      status,
      description,
      domain,
      logo,
    });

    return store;
  }
}
