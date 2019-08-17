//including packages
const express = require('express')
const { check, body } = require('express-validator')
const router = express.Router()

const adminController = require('../controllers/company-admin')

const authMiddleware = require('../middlewares/isAuth')

const Team = require('../model/team')
const Member = require('../model/member')

router.get('/member/edit-member/:memberId', authMiddleware.isAuth, adminController.getEditMember)
router.post('/member/edit-member/:memberId', [  //validation
  check('emailId')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .custom((value, { req }) => {
      return Member.findOne({ $and: [{ _id: { $ne: req.params.memberId } }, { emailId: value }] })
        .then(member => {
          if (member) {
            return Promise.reject('This email address is already registered.')
          }
        })
    })
    .trim(),
  body(['firstName', 'lastName', 'dob', 'address', 'emailId', 'jobTitle', 'jobDesc'], "All fields marked with '*' are required.")
    .not().isEmpty({ ignore_whitespace: true })
], authMiddleware.isAuth, adminController.postEditMember)

router.post('/member/delete/:memberId', authMiddleware.isAuth, adminController.deleteMem)
router.get('/members/:memberId', authMiddleware.isAuth, adminController.getMemberDetails)
router.get('/members', authMiddleware.isAuth, adminController.getMember)
router.get('/add-member', authMiddleware.isAuth, adminController.getAddMember)

router.post('/add-member', authMiddleware.isAuth, [ //validations
  body(['firstName', 'lastName', 'dob', 'address', 'emailId', 'jobTitle', 'jobDesc'], "All fields marked with '*' are required.")
    .not().isEmpty({ ignore_whitespace: true }),
  check('emailId')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .custom((value, { req }) => {
      return Member.findOne({ emailId: value })
        .then(member => {
          if (member) {
            return Promise.reject('This email address is already registered.')
          }
        })
    })
    .trim(),
  body(['lastNmae','firstName','jobTitle'],'Job title,First and Last name can have a maximum of 15 letters each')
    .isLength({max:15}),
  check('jobDesc')
    .isLength({max:60})
    .withMessage('Job title can have a maximum of 60 letters.')
], adminController.postAddMember)



router.post('/team/delete/:teamId', authMiddleware.isAuth, adminController.deleteTeam)
router.get('/teams/:teamId', authMiddleware.isAuth, adminController.getTeamDetails)
router.get('/teams', authMiddleware.isAuth, adminController.getTeam)
router.get('/add-team', authMiddleware.isAuth, adminController.getAddTeam)

router.post('/add-team', authMiddleware.isAuth, [ //validations
  check('team')
  .isLength({max:25})
  .withMessage('Team name can have a maximum of 25 letters.')
    .custom((value, { req }) => {
      return Team.findOne({ team: value })
        .then(team => {
          if (team) {
            return Promise.reject('This team already exists. Head to the Teams section to view team.')
          }
        })
    }),
    check('teamDesc')
    .isLength({max:60})
    .withMessage('Team description can have a maximum of 60 letters'),
  body(['team', 'teamDesc'])
    .not()
    .isEmpty({ ignore_whitespace: true })
    .withMessage('Team Name and Team Description are required.')
], adminController.postAddTeam)

router.post('/delete-account', authMiddleware.isAuth, adminController.postDeleteAccount)


exports.routes = router