#include <stdio.h>
#include <string.h>
#include <stdint.h>
int main(void) {
    double d = 3.7;
    float f = 3.7f;
    int i1 = (int)d;
    uint32_t bits;
    memcpy(&bits, &f, sizeof bits);
    printf("(int)3.7         = %d\n", i1);
    printf("(int)-3.7        = %d\n", (int)-3.7);
    printf("bits of 3.7f     = 0x%08x (%u)\n", bits, bits);

    int big = 300;
    unsigned char uc = (unsigned char)big;
    printf("(unsigned char)300 = %u\n", uc);

    int m = -1;
    unsigned int u = (unsigned int)m;
    printf("(unsigned int)-1 = %u (0x%x)\n", u, u);

    if (-1 < 1u) printf("-1 < 1u : true\n"); else printf("-1 < 1u : false\n");
    if (-1 < 1)  printf("-1 < 1  : true\n");
    printf("sizeof(long)=%zu\n", sizeof(long));
    if (-1 < 1ul) printf("-1 < 1ul: true\n"); else printf("-1 < 1ul: false\n");
    if (-1L < 1u) printf("-1L < 1u: true\n"); else printf("-1L < 1u: false\n");
    return 0;
}
