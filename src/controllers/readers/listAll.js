import { ReaderServices} from '../../services/readerServices.js';
import Boom from '@hapi/boom';

export const listAllReader = async (req, res, next) => {

  const readerManager = new ReaderServices();

  try {

    const allRecords =  await readerManager.listAll();

    if (allRecords) {
      return res.status(201).json({
        success: true,
        message: 'users find it successful',
        users: allRecords
      });
    }

  } catch (error) {
    const boomError = Boom.serverUnavailable(
      'No es posible encontrar todos usuario en la base de datos',
      error
    );
    next(boomError);
  }
};
