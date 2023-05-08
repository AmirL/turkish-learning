import type { User } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { makeAutoObservable } from 'mobx';
import axios from 'axios';

export class UserStore {
  repeatCount = 0;
  user: SerializeFrom<User>;

  constructor(user: SerializeFrom<User>) {
    makeAutoObservable(this);
    this.user = user;
  }

  setRepeatCount(count: number) {
    if (count < 3) {
      count = 0;
    }
    this.repeatCount = count;
  }

  decrementRepeatCount(val: number) {
    this.repeatCount -= val;
  }

  toggleMuteSpeach() {
    this.user.muteSpeach = !this.user.muteSpeach;
    axios.post('/user/mute', { muteSpeach: this.user.muteSpeach });
  }
}
