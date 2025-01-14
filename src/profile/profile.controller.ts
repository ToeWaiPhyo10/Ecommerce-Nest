import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { ProfileService } from './profile.service';
import { CreateProfileDTO } from './dtos/create-profile-dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  @Post()
  @UseGuards(AuthGuard)
  async createProfile(@Request() req, @Body() body: CreateProfileDTO) {
    return this.profileService.create({ ...body, userId: req.user.id });
  }
}
