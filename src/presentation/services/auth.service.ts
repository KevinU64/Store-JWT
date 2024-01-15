import { JwtAdapter, bcryptAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";



export class AuthService {

    // DI
    constructor() {}

    public async registerUser( registerUserDto: RegisterUserDto ) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if ( existUser ) throw CustomError.badRequest('Email already exist');

        try {
            const user = new UserModel(registerUserDto);
            
            // ENCRIPTAR LA CONSTRASEÑA
            user.password = bcryptAdapter.hash( registerUserDto.password );

            await user.save();
            // JWT PARA MANTENER LA AUTENTICACION DEL USUSARIO
            // EMAIL DE CONFIRMACION

            const { password, ...userEntity } = UserEntity.fromObject(user);

            return {
                user: userEntity,
                token: 'ABC'
            };
            
            
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }

    };

    public async loginUser( loginUserDto: LoginUserDto ) {

        const user = await UserModel.findOne({ email: loginUserDto.email });
        if ( !user ) throw CustomError.badRequest('User not exist');

        const isMatch = bcryptAdapter.compare(loginUserDto.password, user.password);
        if( !isMatch ) throw CustomError.badRequest('User not valid');

        const { password, ...userEntity } = UserEntity.fromObject(user);
        
        const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
        if( !token ) throw CustomError.internalServer('Error while creating JWT');

        return {
            user: userEntity,
            token: token,
        };

    };

}