import { Get, Post, Put, Controller, Body, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): any {
    return {message: 'Hello World'};
  }

  @Get(':key')
  async account(@Param('key') key): Promise<any> {
    try {
      return await this.appService.account(key);
    } catch (e) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (e.message.includes('404')) {
        status = HttpStatus.NOT_FOUND;
      }
      throw new HttpException(e.message, status);
    }
  }

  @Post('send')
  async send(@Body() body: any): Promise<any> {
    try {
      return this.appService.send(body.secret, body.to, body.amount, body.memo);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }    
  }

  @Post('activate')
  async activate(@Body() body: any): Promise<any> {   
    return this.appService.activate(body.publicKey); 
  }

  @Post()
  generate(): any {
    return this.appService.generate();
  }
  
}
