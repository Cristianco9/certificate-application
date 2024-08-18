import { ReaderServices } from '../../services/readerServices.js';
import Boom from '@hapi/boom';

export const loginReader = async (req, res, next) => {

  const { username, password } = req.body;
  const readerManager = new ReaderServices();

  try {
    const response = await readerManager.login(username, password);

    switch (response.status) {
      case 'user not found':
        return next(Boom.notFound(
          'Usuario incorrecto. Por favor verifique e intente de nuevo'
        ));
      case 'wrong password':
        return next(Boom.unauthorized(
          'Contraseña incorrecta. Por favor verifique e intente de nuevo'
        ));
      case 'logged':
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token: response.token,
        });
      default:
        return next(Boom.badImplementation('Servicio no disponible'));
    }
  } catch (error) {
    return next(Boom.serverUnavailable(
      'No es posible verificar las credenciales del usuario en la base de datos',
      error
    ));
  }
};
