import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_SERVICE') private userClient: ClientProxy) {}

  create(createUserDto: CreateUserDto) {
    return firstValueFrom(
      this.userClient.send({ cmd: 'create_user' }, createUserDto),
    );
  }

  findAll() {
    return firstValueFrom(
      this.userClient.send({ cmd: 'find_all_users' }, {}),
    );
  }

  findOne(id: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: 'find_one_user' }, id),
    );
  }

  findByEmail(email: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: 'find_user_by_email' }, email),
    );
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return firstValueFrom(
      this.userClient.send(
        { cmd: 'update_user' },
        { id, updateUserDto },
      ),
    );
  }

  remove(id: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: 'remove_user' }, id),
    );
  }
}