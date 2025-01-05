import { RouterContext } from "../../../../../deps.ts";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse.ts";
import { AuthSignin } from "../../application/authSignin.ts";
import { AuthSignup } from "../../application/authSignup.ts";

export class AuthController {
  constructor(
    private readonly authSignin: AuthSignin,
    private readonly authSignup: AuthSignup,
  ) {}

  signin = async ({ request, response }: RouterContext<string>) => {
    const body = await request.body({ type: "json" }).value;
    const { email, password } = body;

    try {
      const auth = await this.authSignin.execute(email, password);
      const responseBody = HttpResponse.success(auth);
      response.status = responseBody.statusCode;
      response.body = responseBody;
    } catch (error) {
      const responseBody = HttpResponse.failed(error.message);
      response.status = responseBody.statusCode;
      response.body = responseBody;
    }
  };

  signup = async ({ request, response }: RouterContext<string>) => {
    const body = await request.body({ type: "json" }).value;
    const { email, password, name, surename, lastname } = body;

    const newUser = {
      email,
      password,
      name,
      surename,
      lastname,
    };

    try {
      await this.authSignup.execute(newUser, password);
      const auth = await this.authSignin.execute(email, password);
      const responseBody = HttpResponse.success(auth);

      response.status = responseBody.statusCode;
      response.body = responseBody;
    } catch (error) {
      const responseBody = HttpResponse.failed(error.message);
      response.status = responseBody.statusCode;
      response.body = responseBody;
    }
  };
}
