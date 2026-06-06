package com.vendorbridge.util;

public class EnglishNumberToWords {
    private static final String[] tensNames = {"", " ten", " twenty", " thirty", " forty", " fifty", " sixty", " seventy", " eighty", " ninety"};
    private static final String[] numNames = {"", " one", " two", " three", " four", " five", " six", " seven", " eight", " nine", " ten", " eleven", " twelve", " thirteen", " fourteen", " fifteen", " sixteen", " seventeen", " eighteen", " nineteen"};

    private static String convertLessThanOneThousand(int number) {
        String soFar;
        if (number % 100 < 20) {
            soFar = numNames[number % 100];
            number /= 100;
        } else {
            soFar = numNames[number % 10];
            number /= 10;
            soFar = tensNames[number % 10] + soFar;
            number /= 10;
        }
        if (number == 0) return soFar;
        return numNames[number] + " hundred" + soFar;
    }

    public static String convert(long number) {
        if (number == 0) { return "zero"; }
        String snumber = Long.toString(number);
        String mask = "000000000000";
        snumber = mask.substring(0, mask.length() - snumber.length()) + snumber;

        int billions = Integer.parseInt(snumber.substring(0, 3));
        int millions  = Integer.parseInt(snumber.substring(3, 6));
        int hundredThousands = Integer.parseInt(snumber.substring(6, 9));
        int thousands = Integer.parseInt(snumber.substring(9, 12));

        String tradBillions = switch (billions) {
            case 0 -> "";
            default -> convertLessThanOneThousand(billions) + " billion ";
        };
        String result =  tradBillions;

        String tradMillions = switch (millions) {
            case 0 -> "";
            default -> convertLessThanOneThousand(millions) + " million ";
        };
        result =  result + tradMillions;

        String tradHundredThousands = switch (hundredThousands) {
            case 0 -> "";
            case 1 -> "one thousand ";
            default -> convertLessThanOneThousand(hundredThousands) + " thousand ";
        };
        result =  result + tradHundredThousands;

        String tradThousand = convertLessThanOneThousand(thousands);
        result =  result + tradThousand;

        return result.replaceAll("^\\s+", "").replaceAll("\\b\\s{2,}\\b", " ").trim();
    }
}
