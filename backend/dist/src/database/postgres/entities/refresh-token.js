var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "./base-entity.js";
let RefreshToken = class RefreshToken extends BaseEntity {
    provider;
    providerUserId;
    accessToken;
    refreshToken;
    accessTokenExpiresAt;
};
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], RefreshToken.prototype, "provider", void 0);
__decorate([
    Index(),
    Column({ type: "string" }),
    __metadata("design:type", String)
], RefreshToken.prototype, "providerUserId", void 0);
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], RefreshToken.prototype, "accessToken", void 0);
__decorate([
    Column({ type: "string" }),
    __metadata("design:type", String)
], RefreshToken.prototype, "refreshToken", void 0);
__decorate([
    Column({ type: "timestamptz" }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "accessTokenExpiresAt", void 0);
RefreshToken = __decorate([
    Entity({ name: "oauth_refresh_token" })
], RefreshToken);
export { RefreshToken };
//# sourceMappingURL=refresh-token.js.map