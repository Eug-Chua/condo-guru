const data = JSON.stringify({
    "email": "bison.chalk814@eagereverest.com",
    "password": "^W^Vx$RfyBy7xM56v3bj"
});
const ONEMAP_URL = "https://www.onemap.gov.sg";
const ROUTING_API = "/api/public/routingsvc/route";
const ACCESS_API = "/api/auth/post/getToken";
const ONEMAP_SEARCH_API= "/api/common/elastic/search";
const REVGEOCODE_API = "/api/public/revgeocode";
let ACCESS_TOKEN; //"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2ZjUzZWM1MzYxYzQ2MThlMzFjNDM5MmQ4Y2FkNTQwYiIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNzA4MDUwMTAxLCJleHAiOjE3MDgzMDkzMDEsIm5iZiI6MTcwODA1MDEwMSwianRpIjoiRldNd2dwclJPc3JpakZZQiIsInVzZXJfaWQiOjI2MDIsImZvcmV2ZXIiOmZhbHNlfQ.vzXlf_Cc-OQx9QSghfBSgmTyFoS_vNrWXVu6E-vIakw";
let headerom;

async function SearchOneMap(keyword, pageNo = 1)
{try {
    // console.log(headerom);
    let response = await axios.get(`${ONEMAP_URL}${ONEMAP_SEARCH_API}`,{
        params: 
        {
           searchVal : keyword,
           returnGeom : "Y",
           getAddrDetails : "Y",
           pageNum : pageNo
        }, 
        headers: headerom
    });
    // console.log(response.data);
    return response.data;
} catch (e) {
    console.error(e)
}
}