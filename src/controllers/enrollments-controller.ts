import { AuthenticatedRequest } from "@/middlewares";
import enrollmentsService from "@/services/enrollments-service";
import { Response } from "express";
import httpStatus from "http-status";
import axios from "axios"

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  const cep: string  = req.params.cep;

  try {
    if(cep.length !== 8) {
      return res.sendStatus(404);
    }
    if (/^\d+$/.test(cep)) {
      return res.sendStatus(404);
    }

    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...req.body,
      userId: req.userId,
    });
    
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  const { cep } = req.query as Record<string, string>;

  try {
    const address = await enrollmentsService.getAddressFromCEP(cep);
    const smallAdress: {
      cep:string,
      logradouro: string,
      complemento: string,
      bairro: string,
      cidade: string,
      uf: string
    } = {
      cep: address.cep,
      logradouro: address.logradouro,
      complemento: address.complemento,
      bairro: address.complemento, 
      cidade: address.cidade,
      uf: address.uf
    };
    res.status(httpStatus.OK).send(smallAdress);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}

