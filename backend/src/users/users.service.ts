import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ 
      username: createUserDto.username 
    }).exec();
    
    if (existingUser) {
      existingUser.isOnline = true;
      existingUser.lastSeen = new Date();
      return existingUser.save();
    }
    
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
  
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async setUserOffline(userId: string): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      return user.save();
    }
    return null;
  }
}