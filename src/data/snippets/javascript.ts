import type { Snippet } from '../types'

export const javascriptSnippets: Snippet[] = [
  {
    id: 'js-arrow-sum',
    language: 'javascript',
    title: 'Arrow function',
    code: `const sum = (a, b) => {\n  return a + b;\n};`,
    explain:
      'Cách viết hàm ngắn gọn. Khác function thường ở chỗ arrow function không có `this` riêng — nó dùng `this` của nơi bao quanh, nên đặt trong class hay callback thì không bị mất ngữ cảnh.',
  },
  {
    id: 'js-array-filter',
    language: 'javascript',
    title: 'Array filter + map',
    code: `const evens = numbers\n  .filter((n) => n % 2 === 0)\n  .map((n) => n * 2);`,
    demo: 'filter-map',
    explain:
      'Giữ lại số chẵn rồi nhân đôi từng số, trả về mảng MỚI — `numbers` không bị đổi. Chạy hai lượt qua mảng: với dữ liệu lớn thì một vòng `for` nhanh hơn, nhưng đọc khó hơn nhiều.',
  },
  {
    id: 'js-fetch',
    language: 'javascript',
    title: 'Fetch API',
    code: `async function getUser(id) {\n  const res = await fetch('/api/users/' + id);\n  return res.json();\n}`,
    explain:
      'Gọi API rồi đọc kết quả dạng JSON. Bẫy hay gặp: `fetch` KHÔNG throw khi server trả 404 hay 500 — muốn biết lỗi phải tự kiểm `res.ok`.',
  },
  {
    id: 'js-class',
    language: 'javascript',
    title: 'Private class field',
    code: `class Stack {\n  #items = [];\n}`,
    explain:
      'Dấu `#` làm field thành private thật ở mức ngôn ngữ: bên ngoài class truy cập `stack.#items` là lỗi cú pháp, không phải quy ước đặt tên `_items` như trước.',
  },
  {
    id: 'js-destructure',
    language: 'javascript',
    title: 'Destructuring',
    code: `const { name, age } = user;\nconsole.log(name, age);`,
    explain:
      'Lấy hai thuộc tính ra thành hai biến cùng tên, thay vì viết `user.name` khắp nơi. `user` là `null` hay `undefined` thì dòng này throw ngay.',
  },
  {
    id: 'js-promise',
    language: 'javascript',
    title: 'Promise chain',
    code: `fetchData()\n  .then((res) => res.json())\n  .catch((err) => console.error(err));`,
    explain:
      'Kiểu xử lý bất đồng bộ trước khi có async/await. `catch` ở cuối bắt lỗi của CẢ chuỗi phía trên, nên chỉ cần một chỗ xử lý lỗi.',
  },
  {
    id: 'js-ternary',
    language: 'javascript',
    title: 'Ternary + default param',
    code: `function greet(name = 'guest') {\n  return name ? 'Hi ' + name : 'Hi there';\n}`,
    explain:
      'Không truyền gì thì `name` là `"guest"`. Nhưng giá trị mặc định chỉ áp dụng cho `undefined` — truyền chuỗi rỗng thì `name` là `""`, rơi vào nhánh sau và ra `"Hi there"`.',
  },
  {
    id: 'js-reduce',
    language: 'javascript',
    title: 'Array reduce',
    code: `const total = items.reduce((sum, item) => {\n  return sum + item.price;\n}, 0);`,
    demo: 'reduce',
    explain:
      'Gộp cả mảng thành một giá trị: cộng dồn giá của mọi item. Số `0` cuối là giá trị khởi đầu — thiếu nó thì mảng rỗng sẽ throw thay vì trả về 0.',
  },
  {
    id: 'js-spread',
    language: 'javascript',
    title: 'Spread operator',
    code: `const merged = { ...defaults, ...options };\nconst copy = [...items, newItem];`,
    demo: 'spread',
    explain:
      'Trải nội dung ra để tạo object/mảng mới thay vì sửa cái cũ. `options` đứng sau nên nó GHI ĐÈ `defaults` — đảo thứ tự là mất hết tuỳ chọn người dùng. Chỉ copy một tầng.',
  },
  {
    id: 'js-event-listener',
    language: 'javascript',
    title: 'Event listener',
    code: `button.addEventListener('click', () => {\n  console.log('clicked!');\n});`,
    explain:
      'Đăng ký hàm chạy mỗi lần nút được bấm. Gọi hai lần là chạy hai lần mỗi cú click — và hàm mũi tên viết trực tiếp như đây thì không có cách nào `removeEventListener` được nữa.',
  },
  {
    id: 'js-try-catch',
    language: 'javascript',
    title: 'Try/catch',
    code: `try {\n  JSON.parse(input);\n} catch { warn('invalid json'); }`,
    explain:
      'Chặn crash khi `input` không phải JSON hợp lệ. `catch` không có tham số là cú pháp mới, dùng khi chỉ cần biết CÓ lỗi chứ không cần đọc lỗi đó là gì.',
  },
]
