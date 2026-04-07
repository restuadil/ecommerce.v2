import { Module } from "@nestjs/common";

import { ProductsController } from "./products.controller";
import { ProductsRepository } from "./products.repository";
import { ProductsService } from "./products.service";
import { BrandsModule } from "../brands/brands.module";
import { CategoriesModule } from "../categories/categories.module";
import { StoresModule } from "../stores/stores.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [BrandsModule, CategoriesModule, UsersModule, StoresModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
