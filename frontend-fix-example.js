// แก้ไข Frontend - หยุดส่ง status สำหรับ user ธรรมดา

// Handle status logic
if (isEditMode) {
  if (isAdmin()) {
    // Admin can control status
    submitData.status = values.status || editingPost?.status || 'pending';
  } else {
    // Regular user: DON'T send status field at all
    // submitData.status = 'pending'; // ❌ ลบบรรทัดนี้
    // Backend จะเก็บ status เดิมไว้
  }
} else {
  // New post: always pending
  submitData.status = 'pending';
}
