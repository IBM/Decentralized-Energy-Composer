import { Injectable } from '@angular/core';

@Injectable()

//provides configurate to composer rest server
export class Configuration {
    public ApiIP: string = "http://localhost";
    public ApiPort: string = "3000";
    public Server: string = this.ApiIP+":"+this.ApiPort;
    public ApiUrl: string = "/api/";
    public ServerWithApiUrl = this.Server + this.ApiUrl;
}
