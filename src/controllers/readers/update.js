import { ReaderServices} from '../../services/readerServices.js';
import Boom from '@hapi/boom';

export const updateOneReader = async (req, res, next) => {

  const { userId, newUserData } = req.body;

  const readerManager = new ReaderServices();

  try {

    const response =  await readerManager.updateOne(userId, newUserData);

    if (response.status === 'UPDATED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'user updated successful',
      });
    }

  } catch (error) {
    const boomError = Boom.serverUnavailable(
      'No es posible actualizar el usuario en la base de datos',
      error
    );
    next(boomError);
  }
};
