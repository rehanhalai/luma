import { Controller, Get, Param, Query } from '@nestjs/common';
import { AvatarsService } from './avatars.service';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.avatarsService.findAll(category);
  }

  @Get('categories')
  getCategories() {
    return this.avatarsService.getCategories();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.avatarsService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avatarsService.findOne(id);
  }
}
