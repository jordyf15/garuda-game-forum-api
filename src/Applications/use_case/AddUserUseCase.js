const RegisterUser = require('../../Domains/users/entities/RegisterUser');

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    console.log('baru masuk use case');
    const registerUser = new RegisterUser(useCasePayload);
    console.log('mau pake db');
    await this._userRepository.verifyAvailableUsername(registerUser.username);
    console.log('wow aman');
    registerUser.password = await this._passwordHash.hash(registerUser.password);
    return this._userRepository.addUser(registerUser);
  }
}

module.exports = AddUserUseCase;
