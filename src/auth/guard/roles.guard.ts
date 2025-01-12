import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../enum/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    console.log('user', user);
    if (!user.role) {
      return false;
    }

    const roleHierarchy = {
      [Role.User]: [Role.User],
      [Role.Moderator]: [Role.Moderator, Role.User],
      [Role.Admin]: [Role.User, Role.Moderator, Role.Admin],
    };
    const accessibleRole = roleHierarchy[user.role] || [];
    console.log('access', accessibleRole);
    return requiredRoles.some((role) => accessibleRole.includes(role));
  }
}
