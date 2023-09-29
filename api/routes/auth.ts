import { Router } from "express";
import passport from "passport";

const authRouter = Router()

authRouter.get('/discord', passport.authenticate('discord'), (req, res) => res.sendStatus(200))
authRouter.get('/discord/redirect', passport.authenticate('discord'), (req, res) => res.sendStatus(200))

export default authRouter