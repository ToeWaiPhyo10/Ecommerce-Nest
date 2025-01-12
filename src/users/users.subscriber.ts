import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }
  listenTo(): Function | string {
    return User;
  }

  beforeInsert(event: InsertEvent<User>): Promise<any> | void {
    console.log(`BEFORE USER INSERTED: `, event.entity);
    const user = event.entity;

    if (user.password && !bcrypt.getRounds(user.password)) {
      user.password = bcrypt.hashSync(user.password, 10);
    }
  }
}
