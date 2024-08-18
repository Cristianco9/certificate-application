import { ReaderServices} from '../../services/readerServices.js';
import Boom from '@hapi/boom';

export const createOneReader = async (req, res, next) => {

  const newUser = {
    username: req.body.username,
    password: req.body.password
  };

  const readerManager = new ReaderServices();

  try {

    const response =  await readerManager.createOne(newUser);

    if (response.status === 'CREATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'user created successful',
      });
    }

  } catch (error) {
    const boomError = Boom.serverUnavailable(
      'No es posible crear el usuario en la base de datos',
      error
    );
    console.error(error);
    next(boomError);
  }
};
