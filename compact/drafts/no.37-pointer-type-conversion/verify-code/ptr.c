#include <stdio.h>
#include <string.h>
#include <stdint.h>
int main(void) {
    int x = 0x12345678;
    int *p = &x;
    unsigned char *c = (unsigned char *)&x;

    printf("&x     = %p\n", (void *)&x);
    printf("p      = %p\n", (void *)p);
    printf("*p     = 0x%x\n", *p);
    printf("sizeof(int) = %zu, sizeof(p) = %zu\n", sizeof(int), sizeof p);

    for (int i = 0; i < 4; i++)
        printf("c[%d] (%p) = 0x%02x\n", i, (void *)(c + i), c[i]);

    printf("p + 1  = %p\n", (void *)(p + 1));
    printf("c + 1  = %p\n", (void *)(c + 1));
    return 0;
}
