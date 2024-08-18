import { ReaderServices} from '../../services/readerServices.js';
import Boom from '@hapi/boom';

export const deleteOneReader = async (req, res, next) => {

  const { userId } = req.body;

  const readerManager = new ReaderServices();

  try {

    const response =  await readerManager.deleteOne(userId);

    if (response.status === 'DELETED SUCCESSFULLY') {
      return res.status(201).json({
        success: true,
        message: 'user deleted successful',
      });
    }

  } catch (error) {
    const boomError = Boom.serverUnavailable(
      'No es posible eliminar el usuario en la base de datos',
      error
    );
    next(boomError);
  }
};
