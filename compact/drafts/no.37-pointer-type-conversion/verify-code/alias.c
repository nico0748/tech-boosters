#include <stdio.h>

int set_and_read(int *ip, float *fp) {
    *ip = 1;
    *fp = 0.0f;   /* ip と fp が同じ場所を指していたら、ここで *ip も 0 になるはず */
    return *ip;
}

int main(void) {
    int x;
    printf("%d\n", set_and_read(&x, (float *)&x));
    return 0;
}
