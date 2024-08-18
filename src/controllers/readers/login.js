import { ReaderServices} from '../../services/readerServices.js';
import Boom from '@hapi/boom';

export const loginReader = async (req, res, next) => {

  const { username, password } = req.body;

  const readerManager = new ReaderServices();

  try {

    const userToken = await readerManager.login( username, password );

    if (!userToken) {
      const boomError = Boom.notFound(
        'No es posible verificar las credenciales del usuario en la base de datos'
      );
      next(boomError);
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: userToken,
    });

  } catch (error) {
      const boomError = Boom.serverUnavailable(
        'No es posible verificar las credenciales del usuario en la base de datos',
        error
      );
      next(boomError);
  }
};
