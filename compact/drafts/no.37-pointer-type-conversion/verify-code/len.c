#include <stdio.h>
#include <string.h>

#define BUF_SIZE 16

void copy(char *dst, const char *src, int len) {
    if (len > BUF_SIZE) {          /* int 同士の比較なので、-1 は通ってしまう */
        puts("too long");
        return;
    }
    printf("len=%d, memcpy に渡るサイズ=%zu\n", len, (size_t)len);
    memcpy(dst, src, len);         /* 第3引数は size_t。-1 は巨大な値になる */
}

int main(void) {
    char buf[BUF_SIZE];
    copy(buf, "hello", 5);
    copy(buf, "hello", -1);        /* ここでバッファの外まで書き込みに行く */
    return 0;
}
