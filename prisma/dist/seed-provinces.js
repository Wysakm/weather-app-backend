"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var provinces = [
    {
        "province_name": "Bangkok",
        "latitude": 13.7563,
        "longitude": 100.5018
    },
    {
        "province_name": "Krabi",
        "latitude": 8.0863,
        "longitude": 98.9063
    },
    {
        "province_name": "Kanchanaburi",
        "latitude": 14.0227,
        "longitude": 99.5328
    },
    {
        "province_name": "Kalasin",
        "latitude": 16.4315,
        "longitude": 103.5059
    },
    {
        "province_name": "Kamphaeng Phet",
        "latitude": 16.4827,
        "longitude": 99.5226
    },
    {
        "province_name": "Khon Kaen",
        "latitude": 16.4419,
        "longitude": 102.8360
    },
    {
        "province_name": "Chanthaburi",
        "latitude": 12.6113,
        "longitude": 102.1035
    },
    {
        "province_name": "Chachoengsao",
        "latitude": 13.6904,
        "longitude": 101.0772
    },
    {
        "province_name": "Chonburi",
        "latitude": 13.3611,
        "longitude": 100.9847
    },
    {
        "province_name": "Chai Nat",
        "latitude": 15.1851,
        "longitude": 100.1251
    },
    {
        "province_name": "Chaiyaphum",
        "latitude": 15.8068,
        "longitude": 102.0284
    },
    {
        "province_name": "Chumphon",
        "latitude": 10.4930,
        "longitude": 99.1800
    },
    {
        "province_name": "Chiang Rai",
        "latitude": 19.9071,
        "longitude": 99.8305
    },
    {
        "province_name": "Chiang Mai",
        "latitude": 18.7883,
        "longitude": 98.9853
    },
    {
        "province_name": "Trang",
        "latitude": 7.5593,
        "longitude": 99.6110
    },
    {
        "province_name": "Trat",
        "latitude": 12.2427,
        "longitude": 102.5177
    },
    {
        "province_name": "Tak",
        "latitude": 16.8839,
        "longitude": 99.1258
    },
    {
        "province_name": "Nakhon Nayok",
        "latitude": 14.2057,
        "longitude": 101.2131
    },
    {
        "province_name": "Nakhon Pathom",
        "latitude": 13.8196,
        "longitude": 100.0645
    },
    {
        "province_name": "Nakhon Phanom",
        "latitude": 17.3910,
        "longitude": 104.7690
    },
    {
        "province_name": "Nakhon Ratchasima",
        "latitude": 14.9799,
        "longitude": 102.0978
    },
    {
        "province_name": "Nakhon Si Thammarat",
        "latitude": 8.4304,
        "longitude": 99.9633
    },
    {
        "province_name": "Nakhon Sawan",
        "latitude": 15.7030,
        "longitude": 100.1367
    },
    {
        "province_name": "Nonthaburi",
        "latitude": 13.8622,
        "longitude": 100.5144
    },
    {
        "province_name": "Narathiwat",
        "latitude": 6.4251,
        "longitude": 101.8252
    },
    {
        "province_name": "Nan",
        "latitude": 18.7756,
        "longitude": 100.7734
    },
    {
        "province_name": "Bueng Kan",
        "latitude": 18.3609,
        "longitude": 103.6466
    },
    {
        "province_name": "Buriram",
        "latitude": 14.9953,
        "longitude": 103.1029
    },
    {
        "province_name": "Pathum Thani",
        "latitude": 14.0208,
        "longitude": 100.5235
    },
    {
        "province_name": "Prachuap Khiri Khan",
        "latitude": 11.8126,
        "longitude": 99.7957
    },
    {
        "province_name": "Prachinburi",
        "latitude": 14.0579,
        "longitude": 101.3725
    },
    {
        "province_name": "Pattani",
        "latitude": 6.8692,
        "longitude": 101.2550
    },
    {
        "province_name": "Phra Nakhon Si Ayutthaya",
        "latitude": 14.3692,
        "longitude": 100.5876
    },
    {
        "province_name": "Phayao",
        "latitude": 19.1664,
        "longitude": 100.2002
    },
    {
        "province_name": "Phang Nga",
        "latitude": 8.4510,
        "longitude": 98.5150
    },
    {
        "province_name": "Phatthalung",
        "latitude": 7.6174,
        "longitude": 100.0743
    },
    {
        "province_name": "Phichit",
        "latitude": 16.4429,
        "longitude": 100.3487
    },
    {
        "province_name": "Phitsanulok",
        "latitude": 16.8298,
        "longitude": 100.2654
    },
    {
        "province_name": "Phetchaburi",
        "latitude": 13.1119,
        "longitude": 99.9399
    },
    {
        "province_name": "Phetchabun",
        "latitude": 16.4189,
        "longitude": 101.1591
    },
    {
        "province_name": "Phrae",
        "latitude": 18.1445,
        "longitude": 100.1405
    },
    {
        "province_name": "Phuket",
        "latitude": 7.8804,
        "longitude": 98.3923
    },
    {
        "province_name": "Maha Sarakham",
        "latitude": 16.1851,
        "longitude": 103.3027
    },
    {
        "province_name": "Mukdahan",
        "latitude": 16.5420,
        "longitude": 104.7208
    },
    {
        "province_name": "Mae Hong Son",
        "latitude": 19.3020,
        "longitude": 97.9654
    },
    {
        "province_name": "Yasothon",
        "latitude": 15.7927,
        "longitude": 104.1451
    },
    {
        "province_name": "Yala",
        "latitude": 6.5413,
        "longitude": 101.2803
    },
    {
        "province_name": "Roi Et",
        "latitude": 16.0538,
        "longitude": 103.6520
    },
    {
        "province_name": "Ranong",
        "latitude": 9.9529,
        "longitude": 98.6085
    },
    {
        "province_name": "Rayong",
        "latitude": 12.6833,
        "longitude": 101.2372
    },
    {
        "province_name": "Ratchaburi",
        "latitude": 13.5282,
        "longitude": 99.8134
    },
    {
        "province_name": "Lopburi",
        "latitude": 14.7995,
        "longitude": 100.6534
    },
    {
        "province_name": "Lampang",
        "latitude": 18.2783,
        "longitude": 99.4877
    },
    {
        "province_name": "Lamphun",
        "latitude": 18.5744,
        "longitude": 99.0087
    },
    {
        "province_name": "Loei",
        "latitude": 17.4860,
        "longitude": 101.7223
    },
    {
        "province_name": "Sisaket",
        "latitude": 15.1186,
        "longitude": 104.3242
    },
    {
        "province_name": "Sakon Nakhon",
        "latitude": 17.1555,
        "longitude": 104.1348
    },
    {
        "province_name": "Songkhla",
        "latitude": 7.1896,
        "longitude": 100.5945
    },
    {
        "province_name": "Satun",
        "latitude": 6.6238,
        "longitude": 100.0678
    },
    {
        "province_name": "Samut Prakan",
        "latitude": 13.5990,
        "longitude": 100.5998
    },
    {
        "province_name": "Samut Songkhram",
        "latitude": 13.4125,
        "longitude": 100.0024
    },
    {
        "province_name": "Samut Sakhon",
        "latitude": 13.5475,
        "longitude": 100.2746
    },
    {
        "province_name": "Sa Kaeo",
        "latitude": 13.8244,
        "longitude": 102.0645
    },
    {
        "province_name": "Saraburi",
        "latitude": 14.5289,
        "longitude": 100.9108
    },
    {
        "province_name": "Sing Buri",
        "latitude": 14.8907,
        "longitude": 100.3968
    },
    {
        "province_name": "Sukhothai",
        "latitude": 17.0068,
        "longitude": 99.8265
    },
    {
        "province_name": "Suphan Buri",
        "latitude": 14.4744,
        "longitude": 100.1177
    },
    {
        "province_name": "Surat Thani",
        "latitude": 9.1381,
        "longitude": 99.3217
    },
    {
        "province_name": "Surin",
        "latitude": 14.8820,
        "longitude": 103.4960
    },
    {
        "province_name": "Nong Khai",
        "latitude": 17.8783,
        "longitude": 102.7470
    },
    {
        "province_name": "Nong Bua Lamphu",
        "latitude": 17.2216,
        "longitude": 102.4262
    },
    {
        "province_name": "Ang Thong",
        "latitude": 14.5896,
        "longitude": 100.4549
    },
    {
        "province_name": "Amnat Charoen",
        "latitude": 15.8656,
        "longitude": 104.6265
    },
    {
        "province_name": "Udon Thani",
        "latitude": 17.4064,
        "longitude": 102.7872
    },
    {
        "province_name": "Uttaradit",
        "latitude": 17.6200,
        "longitude": 100.0993
    },
    {
        "province_name": "Uthai Thani",
        "latitude": 15.3835,
        "longitude": 100.0248
    },
    {
        "province_name": "Ubon Ratchathani",
        "latitude": 15.2400,
        "longitude": 104.8470
    }
];
function seedProvinces() {
    return __awaiter(this, void 0, void 0, function () {
        var createdCount, skippedCount, errorCount, _i, provinces_1, province, existingProvince, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Start seeding provinces...');
                    createdCount = 0;
                    skippedCount = 0;
                    errorCount = 0;
                    _i = 0, provinces_1 = provinces;
                    _a.label = 1;
                case 1:
                    if (!(_i < provinces_1.length)) return [3 /*break*/, 9];
                    province = provinces_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, prisma.msProvince.findFirst({
                            where: { name: province.province_name }
                        })];
                case 3:
                    existingProvince = _a.sent();
                    if (!!existingProvince) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.msProvince.create({
                            data: {
                                name: province.province_name,
                                latitude: province.latitude,
                                longitude: province.longitude
                            }
                        })];
                case 4:
                    _a.sent();
                    console.log("\u2705 Created province: " + province.province_name);
                    createdCount++;
                    return [3 /*break*/, 6];
                case 5:
                    console.log("\u23ED\uFE0F Province already exists: " + province.province_name);
                    skippedCount++;
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("\u274C Error creating province " + province.province_name + ":", error_1);
                    errorCount++;
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9:
                    console.log('\n🎉 Provinces seeding completed!');
                    console.log("\uD83D\uDCCA Summary:");
                    console.log("   \u2705 Created: " + createdCount + " provinces");
                    console.log("   \u23ED\uFE0F Skipped: " + skippedCount + " provinces (already exist)");
                    console.log("   \u274C Errors: " + errorCount + " provinces");
                    console.log("   \uD83D\uDCCB Total processed: " + provinces.length + " provinces");
                    return [2 /*return*/];
            }
        });
    });
}
seedProvinces()["catch"](function (e) {
    console.error('💥 Fatal error during seeding:', e);
    process.exit(1);
})["finally"](function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
