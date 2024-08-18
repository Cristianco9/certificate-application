import { ReaderServices} from '../../services/readerServices.js';
import Boom from '@hapi/boom';

export const listOneReader = async (req, res, next) => {

  const { userId } = req.body;

  const readerManager = new ReaderServices();

  try {

    const record =  await readerManager.listOne(userId);

    if (record) {
      return res.status(201).json({
        success: true,
        message: 'user find it successful',
        user: record
      });
    }

  } catch (error) {
    const boomError = Boom.serverUnavailable(
      'No es posible encontrar el usuario en la base de datos',
      error
    );
    next(boomError);
  }
};
