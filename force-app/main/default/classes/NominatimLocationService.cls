public class NominatimLocationService {

    public static Boolean verifyAddress(String street, String city, String state, String zip) {
        try {
            String address = street + ', ' + city + ', ' + state + ' ' + zip;

            HttpRequest req = new HttpRequest();
            req.setMethod('GET');

            req.setEndpoint(
                'https://nominatim.openstreetmap.org/search' +'?q=' + EncodingUtil.urlEncode(address, 'UTF-8') +'&format=json' +'&limit=1');

            // REQUIRED by Nominatim usage policy
            req.setHeader('User-Agent', 'Salesforce-Learning-App');

            Http http = new Http();
            HttpResponse res = http.send(req);

            if (res.getStatusCode() == 200) {
                List<Object> result = (List<Object>) JSON.deserializeUntyped(res.getBody());
                return !result.isEmpty();
            }
        } catch (Exception e) {
            System.debug('Nominatim Error: ' + e.getMessage());
        }
        return false;
    }
}