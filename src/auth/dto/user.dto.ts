export class UserDto {
    username!: string;
    email!: string;
    password!: string;
    sport!: 'Swimming' | 'Running'
}

export class LoginDto {
    email!: string;
    password!: string;
}