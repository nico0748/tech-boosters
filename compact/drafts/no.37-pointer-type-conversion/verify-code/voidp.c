#include <stdio.h>
#include <stdlib.h>

static int cmp_int(const void *a, const void *b) {
    int x = *(const int *)a;   /* void * を元の型 int * に戻してから読む */
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int set_and_read(int *ip, float *fp) {
    *ip = 1;
    *fp = 0.0f;
    return *ip;
}

int main(void) {
    int a[] = {3, 1, 2};
    qsort(a, 3, sizeof a[0], cmp_int);          /* int * → void * は暗黙に変換される */
    printf("%d %d %d\n", a[0], a[1], a[2]);

    int *p = malloc(sizeof *p);                 /* void * → int * もキャスト不要 */
    *p = 42;
    void *v = p;
    int *q = v;                                 /* 元の型に戻せば p と等しい */
    printf("p == q: %d, *q = %d\n", p == q, *q);

    int x;
    void *vx = &x;
    printf("%d\n", set_and_read(&x, vx));       /* void * を経由しても int を float として書き込む点は同じ */
    free(p);
    return 0;
}
