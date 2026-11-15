#include <stdio.h>
#include <string.h>
#include <stdint.h>
int main(void) {
    float f = 3.7f;
    uint32_t bits;
    memcpy(&bits, &f, sizeof bits);   /* バイト列をそのままコピー */
    printf("(int)f   = %d\n", (int)f);
    printf("bits     = 0x%08x\n", bits);
    printf("sign=%u exp=%u frac=0x%06x\n", bits >> 31, (bits >> 23) & 0xff, bits & 0x7fffff);
    return 0;
}
