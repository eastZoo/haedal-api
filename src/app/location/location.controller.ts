import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(AccessTokenGuard)
  @Get('/')
  userLocation(@Req() req: any) {
    const { coupleId } = req.user;
    return this.locationService.userLocation(coupleId);
  }
}
