import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageQueryDto } from '../../../../shared/application/page.dto';
import { CatalogLikeDto } from '../../application/commerce.dto';
import { CommerceService } from '../../application/commerce.service';

@ApiTags('public')
@Controller()
export class PublicController {
  constructor(private readonly service: CommerceService) {}
  @Get('catalog') catalog(@Query() query: PageQueryDto) {
    return this.service.listCatalog(query.limit, query.cursor);
  }
  @Post('catalog/:id/like') likeCatalog(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CatalogLikeDto,
  ) {
    return this.service.setCatalogLike(id, dto.visitorId, dto.liked);
  }
  @Get('catalog/:id') catalogItem(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getCatalog(id);
  }
  @Get('stylists') stylists(@Query() query: PageQueryDto) {
    return this.service.listStylists(query.limit, query.cursor);
  }
  @Get('home') async home() {
    const [catalog, stylists] = await Promise.all([
      this.service.listCatalog(6),
      this.service.listStylists(6),
    ]);
    return {
      heroTitle: 'Mode sur mesure',
      highlightedCategories: ['Robes', 'Costumes', 'Mariage'],
      catalog,
      stylists,
    };
  }
}
