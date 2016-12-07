angular.module("accountConstants", [])
    .constant(
    'docUploadConstants', {
        DOC_UPLOAD_URL: '/borrower/url',
        DOC_UPLOAD_SIZE: '10MB',
        DOC_LISTENER_DELAY_SECONDS: '5000'
    }
    )

;