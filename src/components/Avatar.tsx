interface AvatarProps {
  src: string | null
  name: string
  /** px — dùng cho cả ảnh lẫn ô chữ cái thay thế để không lệch hàng. */
  size: number
}

/**
 * Người đăng nhập bằng email không có ảnh đại diện, nên phải có ô chữ cái thay thế:
 * nếu chỉ ẩn ảnh đi thì cột tên trong bảng xếp hạng bị so le giữa các kiểu tài khoản.
 */
export function Avatar({ src, name, size }: AvatarProps) {
  const style = { width: size, height: size }

  if (src) {
    return <img src={src} alt="" style={style} className="rounded-full shrink-0 object-cover" />
  }

  return (
    <span
      style={{ ...style, fontSize: size * 0.5 }}
      aria-hidden
      className="rounded-full shrink-0 flex items-center justify-center font-mono uppercase bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
    >
      {name.trim().charAt(0) || '?'}
    </span>
  )
}
